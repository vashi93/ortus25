const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ExcelJS = require('exceljs');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static HTML files
app.use(express.static('public'));
// Helper function to save data to Excel
const saveToExcel = async (fileName, sheetName, data, headers) => {
    const workbook = new ExcelJS.Workbook();

    // Check if the file exists
    if (fs.existsSync(fileName)) {
        await workbook.xlsx.readFile(fileName);
    }

    let worksheet = workbook.getWorksheet(sheetName);

    // Create worksheet if it doesn't exist
    if (!worksheet) {
        worksheet = workbook.addWorksheet(sheetName);
        worksheet.addRow(headers); // Add headers if the worksheet is new
    }

    // Append data
    worksheet.addRow(data);

    // Save the workbook
    await workbook.xlsx.writeFile(fileName);
};

// Endpoint to handle volunteer form submission
app.post('/submit-volunteer', async (req, res) => {
    const volunteerData = {
        fullName: req.body.fullName,
        rollNumber: req.body.rollNumber,
        email: req.body.email,
        department: req.body.department,
        year: req.body.year,
        phoneNumber: req.body.phoneNumber,
    };

    console.log('Volunteer Data:', volunteerData);

    // Save to Excel
    const fileName = 'volunteers.xlsx';
    const headers = ['Full Name', 'Roll Number', 'Email', 'Department', 'Year', 'Phone Number'];
    const data = Object.values(volunteerData);

    try {
        await saveToExcel(fileName, 'Volunteers', data, headers);
        res.send('Volunteer registration submitted successfully!');
    } catch (error) {
        console.error('Error saving volunteer data to Excel:', error);
        res.status(500).send('An error occurred while saving the data.');
    }
});

// Endpoint to handle performer form submission
app.post('/submit-performer', async (req, res) => {
    const performerData = {
        performanceType: req.body.performanceType,
        otherPerformance: req.body.otherPerformance || null,
        teamName: req.body.teamName,
        teamLead: {
            name: req.body.teamLeadName,
            rollNumber: req.body.teamLeadRollNumber,
            email: req.body.teamLeadEmail,
            phoneNumber: req.body.teamLeadPhoneNumber,
        },
        teamSize: req.body.teamSize,
        teamMembers: req.body.teamMembers || [],
    };

    console.log('Performer Data:', performerData);

    // Save to Excel
    const fileName = 'performers.xlsx';
    const headers = [
        'Performance Type',
        'Other Performance',
        'Team Name',
        'Team Lead Name',
        'Team Lead Roll Number',
        'Team Lead Email',
        'Team Lead Phone Number',
        'Team Size',
        'Team Members',
    ];
    const data = [
        performerData.performanceType,
        performerData.otherPerformance,
        performerData.teamName,
        performerData.teamLead.name,
        performerData.teamLead.rollNumber,
        performerData.teamLead.email,
        performerData.teamLead.phoneNumber,
        performerData.teamSize,
        JSON.stringify(performerData.teamMembers), // Convert array to string for Excel
    ];

    try {
        await saveToExcel(fileName, 'Performers', data, headers);
        res.send('Performance registration submitted successfully!');
    } catch (error) {
        console.error('Error saving performer data to Excel:', error);
        res.status(500).send('An error occurred while saving the data.');
    }
});

// Routes for static HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/registration.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration.html'));
});

app.get('/timetable.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'timetable.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Task1: initiate app and run server at 3000

const express = require('express');
const mongoose = require('mongoose');
const path=require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
// Add the correctly-cased folder path as well; the supplied dist folder is named Frontend.
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));

// Task 2 : create mongoDB connection
// Replace <YOUR_PASSWORD> and <YOUR_CLUSTER_URL> with the values from MongoDB Atlas.
const MONGO_URI ="mongodb+srv://jeffreyproject:jeffrey123@cluster0.a64tvri.mongodb.net/"
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('MongoDB connection error:', error.message));

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  salary: { type: Number, required: true }
}, { versionKey: false });

const Employee = mongoose.model('Employee', employeeSchema, 'employees');

// Task 2 : write api with error handling and appropriate api mentioned in the TODO below

// Get all employees
app.get('/api/employeelist', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve employees', error: error.message });
  }
});

// Get one employee by MongoDB ID
app.get('/api/employeelist/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve employee', error: error.message });
  }
});

// Add a new employee
app.post('/api/employeelist', async (req, res) => {
  try {
    const { name, location, position, salary } = req.body;
    if (!name || !location || !position || salary === undefined || salary === '') {
      return res.status(400).json({ message: 'name, location, position and salary are required' });
    }
    const employee = await Employee.create({ name, location, position, salary: Number(salary) });
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add employee', error: error.message });
  }
});

// Delete one employee by MongoDB ID
app.delete('/api/employeelist/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee deleted successfully', employee });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete employee', error: error.message });
  }
});

// Update an employee. The frontend sends the employee ID in the request body as _id or id.
app.put('/api/employeelist', async (req, res) => {
  try {
    const { _id, id, name, location, position, salary } = req.body;
    const employeeId = _id || id;
    if (!employeeId || !mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({ message: 'A valid employee _id is required' });
    }
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (position !== undefined) updates.position = position;
    if (salary !== undefined && salary !== '') updates.salary = Number(salary);
    const employee = await Employee.findByIdAndUpdate(employeeId, updates, {
      new: true,
      runValidators: true
    });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update employee', error: error.message });
  }
});

// Keep the supplied frontend fallback route.
//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

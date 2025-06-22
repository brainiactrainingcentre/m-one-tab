import express from 'express';
import userRoute from './user.router.js';
import studentRoute from './student.router.js';
import subjectRoute from './subject.router.js';
import feeRouter from './fee.router.js';
import teacherRoute from './teacher.router.js';
import classRouter from './class.router.js';
import attendanceRouter from './studentAttendance.router.js';
import parentRouter from './parent.router.js';
import staffAttendanceRouter from './staffAtandance.router.js';

const mainRoute = express.Router();

mainRoute.use('/api', userRoute);
mainRoute.use('/api/class', classRouter);
mainRoute.use('/api/subject', subjectRoute);
mainRoute.use('/api/teacher', teacherRoute);
mainRoute.use('/api/student', studentRoute);
mainRoute.use('/api/parent', parentRouter);
mainRoute.use('/api/student-attendance', attendanceRouter);
mainRoute.use('/api/staff-attendance', staffAttendanceRouter);
mainRoute.use('/api/fee', feeRouter);

mainRoute.get('/', (req, res) => {
  res.send('Welcome');
});

export default mainRoute;

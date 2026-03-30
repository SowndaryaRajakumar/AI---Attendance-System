const { markAttendance, getStudentAttendance, getReport } = require('../controllers/attendanceController');
const { authenticate, authorizeRoles } = require('../utils/authMiddleware');

module.exports = (router) => {
    router.post('/attendance/mark', authenticate, authorizeRoles('faculty', 'admin'), markAttendance);
    router.get('/attendance/report', authenticate, authorizeRoles('faculty', 'admin'), getReport);
    router.get('/attendance/:studentId', authenticate, getStudentAttendance);
};

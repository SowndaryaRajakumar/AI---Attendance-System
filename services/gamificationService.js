const { getAttendance } = require('../db/mongo');
const { logError } = require('../utils/logger');

async function getLeaderboard() {
    const attendanceColl = getAttendance();
    const pipelineWithUsers = [
        { $match: { status: 'present' } },
        { $group: { _id: '$studentId', classesAttended: { $sum: 1 } } },
        { $sort: { classesAttended: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: 'id',
                as: 'studentInfo'
            }
        },
        { $unwind: '$studentInfo' },
        {
            $project: {
                studentId: '$_id',
                name: '$studentInfo.name',
                classesAttended: 1,
                _id: 0
            }
        }
    ];

    try {
        return await attendanceColl.aggregate(pipelineWithUsers).toArray();
    } catch (e) {
        logError('Leaderboard generation error', e);
        return [];
    }
}

module.exports = { getLeaderboard };

import schedulesendsProvider from '../providers/schedulesendsProvider.js';

const schedulesendsRepository = {
  getAllScheduledSends: () => schedulesendsProvider.getAllScheduledSends(),
  getScheduledSendById: (mailobjectid) => schedulesendsProvider.getScheduledSendById(mailobjectid),
  createScheduledSend: (mailobjectid, sendate) => schedulesendsProvider.createScheduledSend(mailobjectid, sendate),
};

export default schedulesendsRepository;

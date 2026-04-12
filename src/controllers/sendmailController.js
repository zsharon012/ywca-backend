import sendmailProvider from '../providers/sendmailProvider.js';

const sendMail = async (req, res, next) => {
  try {
    const { templateid, recipientids, contactgroupids } = req.body;

    if (!templateid || (!recipientids && !contactgroupids)) {
      return res
        .status(400)
        .json({ error: 'templateid and at least one of recipientids or contactgroupids are required' });
    }

    const result = await sendmailProvider.sendMail(templateid, recipientids, contactgroupids);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export default {
  sendMail,
};

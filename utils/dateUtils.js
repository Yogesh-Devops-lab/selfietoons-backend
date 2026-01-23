import moment from 'moment-timezone';

export const getDateRange = (type, from, to) => {
  let startDate = moment.tz('Asia/Kolkata').startOf('day');
  let endDate = moment.tz('Asia/Kolkata').endOf('day');

  switch (type) {
    case 'day':
      break;
    case 'week':
      startDate = startDate.clone().subtract(7, 'days');
      break;
    case 'month':
      startDate = startDate.clone().subtract(1, 'month');
      break;
    case 'year':
      startDate = startDate.clone().subtract(1, 'year');
      break;
    case '   ':
      if (from && to) {
        startDate = moment.tz(from, 'Asia/Kolkata').startOf('day');
        endDate = moment.tz(to, 'Asia/Kolkata').endOf('day');
      }
      break;
    default:
      throw new Error('Invalid type');
  }

  return {
    startDate: startDate.toDate(),
    endDate: endDate.toDate()
  };
};

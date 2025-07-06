const isRegularDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const today = new Date();

  if (isNaN(date.getTime())) return false;

  return year >= 1850 && date <= today;
};

export default isRegularDate;

const currentYear = new Date().getFullYear();

const isRegularSeason = (season) => {
  if (!season) return false;
  
  const seasonRegex = /^(\d{4})\/(\d{4})$/;
  const fullYearRegex = /^(\d{4})$/;

  if (seasonRegex.test(season)) {
    const [, startYear, endYear] = season.match(seasonRegex);
    return parseInt(startYear) >= 1850 && parseInt(endYear) <= currentYear + 1 && parseInt(startYear) + 1 === parseInt(endYear);
  }

  if (fullYearRegex.test(season)) {
    const year = parseInt(season);
    return year >= 1850 && year <= currentYear;
  }

  return false;
};

export default isRegularSeason;

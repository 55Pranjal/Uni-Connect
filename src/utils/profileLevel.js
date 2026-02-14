/**
 * Calculates profile level from skills
 * @param {Array<{ name: string, level: number }>} skills
 * @returns {number}
 */
export const calculateProfileLevel = (skills = []) => {
  if (!Array.isArray(skills)) return 0;

  return skills.reduce((total, skill) => {
    const level = typeof skill.level === "number" ? skill.level : 0;
    return total + level;
  }, 0);
};

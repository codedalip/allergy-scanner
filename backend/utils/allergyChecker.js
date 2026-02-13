function checkAllergy(userAllergies, ingredients) {

  const normalizedUser = userAllergies.map(a =>
    a.toLowerCase().trim()
  );

  const normalizedIngredients = ingredients.map(i =>
    i.toLowerCase().trim()
  );

  const matches = normalizedIngredients.filter(i =>
    normalizedUser.includes(i)
  );

  return {
    safe: matches.length === 0,
    matches
  };
}

module.exports = checkAllergy;

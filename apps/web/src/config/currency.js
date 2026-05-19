
export const currencyConfig = {
  defaultCurrency: 'MAD',
  fxRateEurMad: 11,
};

export const convertMadToEur = (priceMad) => {
  return Math.round(priceMad / currencyConfig.fxRateEurMad);
};


export default defineI18nLocale(async (locale) => {

  const response = await $fetch(`http://localhost:8093/api/configurations/translations/ru`)

  // const result = await fetchTranslations('ru');

  console.log(
    'TEST____CATHCH_TRANSLATIONS',
    response
  );

  return response.translations;
})
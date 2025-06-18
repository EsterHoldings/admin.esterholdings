export const companyMenuRoutes = (activeLink, t) => {
  return {
    [t(`landing.header.megaMenu.${activeLink}[0].section`)]: {
      path: "about-company",
      list: [
        "about-company",
        "documents",
        "company-news",
        "contacts",
        "career",
      ],
    },
  };
};

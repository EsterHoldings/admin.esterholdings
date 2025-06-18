export const partnershipMenuRoutes = (activeLink, t) => {
  return {
    [t(`landing.header.megaMenu.${activeLink}[0].section`)]: {
      path: "partnership",
      list: ["register-ib", "generate-income"],
    },
  };
};

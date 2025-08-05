import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
export default createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  components: {
    VDateInput,
  },
  theme: {
    dark: false,
  },
});

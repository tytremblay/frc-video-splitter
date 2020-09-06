import { createMuiTheme, Theme } from '@material-ui/core/styles';

const darkTheme: Theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

const lightTheme: Theme = createMuiTheme();

export default function getTheme(theme: string): Theme {
  switch (theme) {
    case 'light':
      return lightTheme;
    case 'dark':
      return darkTheme;
    default:
      return lightTheme;
  }
}

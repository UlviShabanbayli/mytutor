import { render, screen } from '@testing-library/react-native';
import { Text } from './Text';

describe('Text', () => {
  it('writes Azerbaijani CAPS with the dotted İ', async () => {
    await render(<Text variant="overline">Sənin sinfin üçün</Text>);
    expect(screen.getByText('SƏNİN SİNFİN ÜÇÜN')).toBeTruthy();
  });

  it('upper-cases an `uppercase` class the same way', async () => {
    await render(<Text className="font-sans-black uppercase">Şagirdəm</Text>);
    expect(screen.getByText('ŞAGİRDƏM')).toBeTruthy();
  });
});

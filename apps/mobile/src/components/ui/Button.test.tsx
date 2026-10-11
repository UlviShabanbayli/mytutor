import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label and handles presses', async () => {
    const onPress = jest.fn();
    await render(<Button label="Sual ver" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Sual ver' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire presses while loading', async () => {
    const onPress = jest.fn();
    await render(<Button label="Sual ver" onPress={onPress} loading />);

    await fireEvent.press(screen.getByRole('button', { name: 'Sual ver' }));

    expect(onPress).not.toHaveBeenCalled();
  });
});

import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label and handles presses', async () => {
    const onPress = jest.fn();
    await render(<Button label="Testə başla" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Testə başla' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire presses while disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Yoxla" onPress={onPress} disabled />);

    await fireEvent.press(screen.getByRole('button', { name: 'Yoxla' }));

    expect(onPress).not.toHaveBeenCalled();
  });
});

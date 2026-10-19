import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { HoldButton } from './HoldButton';
import { SegmentedControl } from './SegmentedControl';
import { Switch } from './Switch';

describe('Switch', () => {
  it('is a switch that reports the opposite value', async () => {
    const onValueChange = jest.fn();
    await render(<Switch value={false} onValueChange={onValueChange} accessibilityLabel="Səs" />);

    const control = screen.getByRole('switch', { name: 'Səs' });
    expect(control.props.accessibilityState).toMatchObject({ checked: false });
    await fireEvent.press(control);

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('ignores presses while disabled', async () => {
    const onValueChange = jest.fn();
    await render(<Switch value onValueChange={onValueChange} accessibilityLabel="Səs" disabled />);

    await fireEvent.press(screen.getByRole('switch', { name: 'Səs' }));

    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('SegmentedControl', () => {
  const segments = [
    { value: 'light', label: 'Açıq' },
    { value: 'dark', label: 'Tünd' },
  ] as const;

  it('changes to another segment but not to the chosen one', async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControl
        segments={segments}
        value="light"
        onChange={onChange}
        accessibilityLabel="Görünüş"
      />,
    );

    await fireEvent.press(screen.getByRole('radio', { name: 'Açıq' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Tünd' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('dark');
  });
});

describe('HoldButton', () => {
  it('lets a screen reader activate it without holding', async () => {
    const onHold = jest.fn();
    await render(<HoldButton label="İpucu" onHold={onHold} />);

    await fireEvent(screen.getByRole('button', { name: 'İpucu' }), 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    });

    expect(onHold).toHaveBeenCalledTimes(1);
  });

  it('fires only after the finger has held for half a second', async () => {
    jest.useFakeTimers();
    const onHold = jest.fn();
    await render(<HoldButton label="İpucu" onHold={onHold} />);
    const button = screen.getByRole('button', { name: 'İpucu' });

    await fireEvent(button, 'pressIn');
    await act(() => jest.advanceTimersByTime(300));
    await fireEvent(button, 'pressOut');
    await act(() => jest.advanceTimersByTime(500));
    expect(onHold).not.toHaveBeenCalled();

    await fireEvent(button, 'pressIn');
    await act(() => jest.advanceTimersByTime(500));
    expect(onHold).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});

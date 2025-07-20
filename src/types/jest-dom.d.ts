import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(_className: string): R;
      toHaveAttribute(_attr: string, _value?: string): R;
      toHaveTextContent(_text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;
      toHaveFocus(): R;
      toHaveFormValues(_expectedValues: Record<string, unknown>): R;
      toHaveDisplayValue(_value: string | string[]): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveValue(_value: string | string[] | number): R;
      toHaveStyle(_css: string | Record<string, unknown>): R;
      toHaveAccessibleName(_name: string | RegExp): R;
      toHaveAccessibleDescription(_description: string | RegExp): R;
    }
  }
} 
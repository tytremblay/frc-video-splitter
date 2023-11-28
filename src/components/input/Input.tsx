import { ComponentProps } from 'react';

type InputProps = ComponentProps<'input'> & {
  label?: string;
};
export function Input(props: InputProps) {
  return (
    <div>
      <label
        htmlFor={props.name}
        className="block text-sm font-medium leading-6 text-gray-400"
      >
        {props.label}
      </label>
      <div className="mt-2">
        <input
          type={props.type}
          name={props.name}
          id={props.id}
          className="block w-full rounded-md border-0 py-1.5 text-white  bg-white/10 placeholder:text-gray-400 focus:ring02 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
        />
      </div>
    </div>
  );
}

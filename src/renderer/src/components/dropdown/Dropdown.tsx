import { useState } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import clsx from 'clsx';

export interface DropdownOption<T> {
  name: string;
  value: T;
  secondaryText?: string;
}

interface DropdownProps<T> {
  selectedOption?: T;
  options: DropdownOption<T>[];
  onSelect?: (value: T) => void;
  label?: string;
}

export function Dropdown<T>(props: DropdownProps<T>) {
  const [query, setQuery] = useState('');

  const filteredOptions =
    query === ''
      ? props.options
      : props.options.filter((option) =>
          option.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <Combobox value={props.selectedOption} onChange={(option) => props.onSelect(option)}>
      {props.label && (
        <ComboboxLabel className="block text-sm font-medium leading-6 text-white">
          {props.label}
        </ComboboxLabel>
      )}
      <div className="relative mt-2">
        <ComboboxInput
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(option: DropdownOption<T>) => option?.name}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </ComboboxButton>

        {filteredOptions.length > 0 && (
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.map((option) => (
              <ComboboxOption
                key={option.name}
                value={option.value}
                className={({ focus }) =>
                  clsx(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    focus ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ focus, selected }) => (
                  <>
                    <div className="flex">
                      <span className={clsx('truncate', selected && 'font-semibold')}>
                        {option.name}
                      </span>
                      {option.secondaryText && (
                        <span
                          className={clsx(
                            'ml-2 truncate text-gray-500',
                            focus ? 'text-indigo-200' : 'text-gray-500'
                          )}
                        >
                          {`(${option.secondaryText})`}
                        </span>
                      )}
                    </div>
                    {selected && (
                      <span
                        className={clsx(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          focus ? 'text-white' : 'text-indigo-600'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
}

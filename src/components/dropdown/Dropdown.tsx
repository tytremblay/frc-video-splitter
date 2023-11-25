import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useState } from 'react';

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
      : props.options.filter((option) => {
          return option.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox
      as="div"
      value={props.selectedOption}
      onChange={(option) => props.onSelect && props.onSelect(option)}
    >
      {props.label && (
        <Combobox.Label className="block text-sm font-medium leading-6 text-gray-400">
          {props.label}
        </Combobox.Label>
      )}
      <div className="relative mt-2">
        <Combobox.Input
          className="w-full rounded-md border-0 bg-white/10 py-1.5 pl-3 pr-12 text-white0 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(option: DropdownOption<T>) => option?.name}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredOptions.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.map((option) => (
              <Combobox.Option
                key={option.name}
                value={option.value}
                className={({ active }) =>
                  clsx(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex">
                      <span
                        className={clsx(
                          'truncate',
                          selected && 'font-semibold'
                        )}
                      >
                        {option.name}
                      </span>
                      {option.secondaryText && (
                        <span
                          className={clsx(
                            'ml-2 truncate text-gray-500',
                            active ? 'text-indigo-200' : 'text-gray-500'
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
                          active ? 'text-white' : 'text-indigo-600'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}

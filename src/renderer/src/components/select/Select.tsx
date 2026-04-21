import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

export type SelectOption<T> = {
  id: string;
  displayValue: string;
  value: T;
};

interface SelectProps<T> {
  selectedOption?: SelectOption<T>;
  options: SelectOption<T>[];
  onSelect?: (value: T) => void;
  label?: string;
}

export function Select<T>(props: SelectProps<T>) {
  return (
    <Listbox value={props.selectedOption} onChange={(selected) => props.onSelect && props.onSelect(selected.value)}>
      {props.label && (
        <ListboxLabel className="block text-sm font-medium leading-6 text-white">
          {props.label}
        </ListboxLabel>
      )}
      <div className="relative mt-2">
        <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
          <span className="block truncate">{props.selectedOption?.displayValue}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </ListboxButton>

        <Transition leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {props.options.map((option) => (
              <ListboxOption
                key={option.id}
                value={option}
                className={({ focus }) =>
                  clsx(
                    focus ? 'bg-indigo-600 text-white' : 'text-gray-900',
                    'relative cursor-default select-none py-2 pl-3 pr-9'
                  )
                }
              >
                {({ selected, focus }) => (
                  <>
                    <span className={clsx(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                      {option.id}
                    </span>
                    {selected && (
                      <span
                        className={clsx(
                          focus ? 'text-white' : 'text-indigo-600',
                          'absolute inset-y-0 right-0 flex items-center pr-4'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>
  );
}

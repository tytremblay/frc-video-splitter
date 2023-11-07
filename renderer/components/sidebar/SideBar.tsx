
import { ArrowUpTrayIcon, FilmIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';


const navigation = [
  { name: 'Matches', href: '/matches', icon: TableCellsIcon },
  { name: 'Split', href: '/split', icon: FilmIcon },
  { name: 'Upload', href: '/upload', icon: ArrowUpTrayIcon }, ,
];

interface SidebarProps {
  currentPage: string;
}

export function SideBar(props: SidebarProps) {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
      <div className="flex h-16 shrink-0 items-center">
        <img
          className="h-8 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
          alt="Your Company"
        />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>

                  <a
                    href={item.href}
                    className={clsx(
                      props.currentPage === item.href
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                    )}
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>

        </ul>
      </nav>
    </div>);
}
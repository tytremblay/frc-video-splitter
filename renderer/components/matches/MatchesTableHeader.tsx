export function MatchesTableHeader() {

  return (
    <>
      <thead>
        <tr>
          <th
            scope="col"
            className="sticky top-0 border-b border-gray-300  bg-opacity-75 py-3.5 pl-2 pr-3 text-left text-sm font-semibold text-white backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
          >
            Name
          </th>
          <th
            scope="col"
            className="sticky top-0 hidden border-b border-gray-300  bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-white backdrop-blur backdrop-filter sm:table-cell"
          >
            Description
          </th>
          <th
            scope="col"
            className="sticky top-0 border-b border-gray-300  bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-white backdrop-blur backdrop-filter"
          >
            From
          </th>
          <th
            scope="col"
            className="sticky top-0 border-b border-gray-300  bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-white backdrop-blur backdrop-filter"
          >
            To
          </th>
          <th
            scope="col"
            className="sticky top-0 border-b border-gray-300  bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-white backdrop-blur backdrop-filter"
          >
            Add
          </th>

        </tr>
      </thead>
    </>
  );
}
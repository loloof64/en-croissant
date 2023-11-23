import { Center, Flex, Text, TextInput } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";
import { DatabaseInfo, Player, query_tournaments } from "@/utils/db";
import TournamentCard from "./TournamentCard";
import useStyles from "./styles";
import GridLayout from "./GridLayout";

function TournamentTable({ database }: { database: DatabaseInfo }) {
  const file = database.file;
  const [tournaments, setTournaments] = useState<Player[]>([]);
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(25);
  const [activePage, setActivePage] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [sort, setSort] = useState<DataTableSortStatus>({
    columnAccessor: "id",
    direction: "asc",
  });

  const { classes } = useStyles();

  useEffect(() => {
    setActivePage(1);
    setSelected(null);
    setLoading(true);
    query_tournaments(file, {
      name: name,
      page: 1,
      pageSize: limit,
      sort: sort.columnAccessor,
      direction: sort.direction,
    }).then((res) => {
      setLoading(false);
      setTournaments(res.data);
      setCount(res.count);
    });
  }, [name, limit, file]);

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    query_tournaments(file, {
      name: name === "" ? undefined : name,
      page: activePage,
      pageSize: limit,
      sort: sort.columnAccessor,
      direction: sort.direction,
    }).then((res) => {
      setLoading(false);
      setTournaments(res.data);
      setCount(res.count);
    });
  }, [activePage, sort]);

  useHotkeys([
    [
      "ArrowUp",
      () => {
        setSelected((prev) => {
          if (prev === null) {
            return null;
          }
          if (prev === 0) {
            return 0;
          }
          return prev - 1;
        });
      },
    ],
    [
      "ArrowDown",
      () => {
        setSelected((prev) => {
          if (prev === null) {
            return 0;
          }
          if (prev === tournaments.length - 1) {
            return tournaments.length - 1;
          }
          return prev + 1;
        });
      },
    ],
  ]);

  return (
    <GridLayout
      search={
        <Flex sx={{ alignItems: "center", gap: 10 }}>
          <TextInput
            sx={{ flexGrow: 1 }}
            placeholder="Search tournament..."
            icon={<IconSearch size="1rem" />}
            value={name}
            onChange={(v) => setName(v.currentTarget.value)}
          />
        </Flex>
      }
      table={
        <DataTable
          withBorder
          highlightOnHover
          records={tournaments}
          fetching={loading}
          columns={[
            { accessor: "id", sortable: true },
            { accessor: "name", sortable: true },
          ]}
          rowClassName={(_, i) => (i === selected ? classes.selected : "")}
          noRecordsText="No tournaments found"
          totalRecords={count}
          recordsPerPage={limit}
          page={activePage}
          onPageChange={setActivePage}
          onRecordsPerPageChange={setLimit}
          sortStatus={sort}
          onSortStatusChange={setSort}
          recordsPerPageOptions={[10, 25, 50]}
          onRowClick={(_, i) => {
            setSelected(i);
          }}
        />
      }
      preview={
        selected !== null ? (
          <TournamentCard
            tournament={tournaments[selected]}
            file={database.file}
          />
        ) : (
          <Center h="100%">
            <Text>No tournament selected</Text>
          </Center>
        )
      }
    />
  );
}

export default TournamentTable;

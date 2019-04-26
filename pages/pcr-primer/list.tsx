import { KitsuResponse } from "kitsu";
import Link from "next/link";
import { withRouter, WithRouterProps } from "next/router";
import { ColumnDefinition, Head, Nav, QueryTable } from "../../components";
import { MetaWithTotal } from "../../types/seqdb-api/meta";
import { PcrPrimer } from "../../types/seqdb-api/resources/PcrPrimer";

const PCRPRIMER_TABLE_COLUMNS: Array<ColumnDefinition<PcrPrimer>> = [
  {
    Cell: ({ original: { id, name } }) => (
      <Link href={`/pcr-primer/view?id=${id}`}>
        <a>{name}</a>
      </Link>
    ),
    Header: "Name",
    accessor: "name"
  },
  {
    Header: "Group Name",
    accessor: "group.groupName"
  },
  "region.name",
  "type",
  "lotNumber",
  "application",
  "direction",
  "seq",
  "tmCalculated"
];

export function PcrPrimerListPage({ router }: WithRouterProps) {
  function goToBulkEditor(response: KitsuResponse<PcrPrimer[], MetaWithTotal>) {
    const ids = response.data.map(obj => obj.id).join(",");

    router.push({
      pathname: "/pcr-primer/bulk-edit",
      query: { ids },
    });
  }

  return (
    <div>
      <Head title="PCR Primers" />
      <Nav />
      <div className="container-fluid">
        <h1>PCR Primers</h1>
        <Link href="/pcr-primer/edit" prefetch={true}>
          <a>Add PCR Primer</a>
        </Link>
        <QueryTable<PcrPrimer>
          columns={PCRPRIMER_TABLE_COLUMNS}
          include="group,region"
          path="pcrPrimer"
          reactTableProps={({ response }) => ({
            TableComponent: ({ children }) => (
              <div>
                <div>
                  <button onClick={() => goToBulkEditor(response)}>
                    Bulk Edit
                  </button>
                </div>
                {children}
              </div>
            )
          })}
        />
      </div>
    </div>
  );
}

export default withRouter(PcrPrimerListPage);

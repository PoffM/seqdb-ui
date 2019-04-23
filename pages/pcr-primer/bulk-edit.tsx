import { Form, Formik, FormikActions, Field } from "formik";
import { deserialise } from "kitsu-core";
import { withRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import ReactTable, { Column } from "react-table";
import { ApiClientContext, LoadingSpinner } from "../../components";
import { Operation } from "../../components/api-client/jsonapi-types";
import { PcrPrimer } from "../../types/seqdb-api/resources/PcrPrimer";

interface PcrPrimerBulkEditProps {
  ids: number[];
}

export function PcrPrimerBulkEdit({ ids }: PcrPrimerBulkEditProps) {
  const { doOperations } = useContext(ApiClientContext);

  const [initialPrimers, setPrimers] = useState<PcrPrimer[]>([]);

  useEffect(() => {
    async function getData() {
      const operations: Operation[] = ids.map(id => ({
        op: "GET",
        path: `pcrPrimer/${id}?include=group,region`,
        value: {
          id,
          type: "pcrPrimer"
        }
      }));
      const responses = await doOperations(operations);

      const responsePrimers = (await Promise.all(
        responses.map(deserialise)
      )).map(res => res.data);

      setPrimers(responsePrimers);
      console.log(responsePrimers)
    }
    getData();
  }, [ids]);

  if (!initialPrimers.length) {
    return <LoadingSpinner loading={true} />;
  }

  function onSubmit(
    values: PcrPrimer[],
    formikActions: FormikActions<PcrPrimer[]>
  ) {
    console.log(values);
  }

  return (
    <Formik initialValues={initialPrimers} onSubmit={onSubmit}>
      <Form>
        <ReactTable data={initialPrimers} columns={COLUMNS} />
      </Form>
    </Formik>
  );
}

const COLUMNS: Column<PcrPrimer>[] = [
  {
    accessor: "name",
    Header: "Name",
    Cell: ({ index }) => <Field name={`${index}.name`} />
  }
];

export default withRouter(({ router: { query: { ids } } }) => (
  <PcrPrimerBulkEdit ids={(ids as string).split(",").map(Number)} />
));

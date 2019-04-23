import { Field, Form, Formik, FormikActions } from "formik";
import { deserialise } from "kitsu-core";
import { isEqual, isObject, transform } from "lodash";
import { SingletonRouter, withRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import ReactTable, { Column } from "react-table";
import titleCase from "title-case";
import {
  ApiClientContext,
  LoadingSpinner,
  SubmitButton
} from "../../components";
import { Operation } from "../../components/api-client/jsonapi-types";
import { PcrPrimer } from "../../types/seqdb-api/resources/PcrPrimer";
import { serialize } from "../../util/serialize";

interface PcrPrimerBulkEditProps {
  ids: number[];
  router: SingletonRouter;
}

export function PcrPrimerBulkEdit({ ids, router }: PcrPrimerBulkEditProps) {
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
    }
    getData();
  }, [ids]);

  if (!initialPrimers.length) {
    return <LoadingSpinner loading={true} />;
  }

  async function onSubmit(
    submittedValues: PcrPrimer[],
    { setStatus, setSubmitting }: FormikActions<PcrPrimer[]>
  ) {
    const primerDiffs = Object.values<any>(
      difference(submittedValues, initialPrimers)
    );

    const serializedPrimerDiffs = await Promise.all(
      primerDiffs.map(diff => serialize({ resource: diff, type: "pcrPrimer" }))
    );

    const operations: Operation[] = serializedPrimerDiffs.map<Operation>(
      primerDiff => ({
        op: "PATCH",
        path: `pcrPrimer/${primerDiff.id}`,
        value: primerDiff
      })
    );

    try {
      const responses = await doOperations(operations);
      setStatus(`${responses.length} rows updated.`);
    } catch (error) {
      setStatus(error.message);
      setSubmitting(false);
    }
    setSubmitting(false);
  }

  return (
    <Formik initialValues={initialPrimers} onSubmit={onSubmit}>
      {({ isSubmitting, status }) => (
        <Form>
          {status && <div className="alert alert-info">{status}</div>}
          <ReactTable
            columns={COLUMNS}
            data={initialPrimers}
            showPaginationBottom={false}
            loading={isSubmitting}
            manual={true}
            pageSize={initialPrimers.length}
            sortable={false}
          />
          <SubmitButton />
        </Form>
      )}
    </Formik>
  );
}

const COLUMNS: Array<Column<PcrPrimer>> = [
  stringColumn("name"),
  stringColumn("application")
];

function stringColumn(accessor: string) {
  return {
    Cell: ({ index }) => (
      <Field className="form-control" name={`${index}.${accessor}`} />
    ),
    Header: titleCase(accessor),
    accessor
  };
}

function difference(object, base) {
  function changes(object, base) {
    return transform(object, (result, value, key: any) => {
      if (!isEqual(value, base[key]) || ["id", "type"].includes(key)) {
        result[key] =
          isObject(value) && isObject(base[key])
            ? changes(value, base[key])
            : value;
      }
    });
  }
  return changes(object, base);
}

export default withRouter(({ router }) => (
  <PcrPrimerBulkEdit
    ids={(router.query.ids as string).split(",").map(Number)}
    router={router}
  />
));

import { Form, Formik, FormikActions } from "formik";
import { KitsuResource } from "kitsu";
import { deserialise } from "kitsu-core";
import { isEqual, isObject, transform } from "lodash";
import { SingletonRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import ReactTable, { Column } from "react-table";
import { SubmitButton } from "../../components";
import { ApiClientContext, LoadingSpinner } from "../../components/";
import { Operation } from "../../components/api-client/jsonapi-types";
import { serialize } from "../../util/serialize";

interface BulkEditorProps {
  columns: Column[];
  findPath: (id: number | string) => string;
  ids: number[];
  patchPath: (id: number | string) => string;
  router: SingletonRouter;
  type: string;
}

export function BulkEditor({
  columns,
  findPath,
  ids,
  patchPath,
  router,
  type
}: BulkEditorProps) {
  const { doOperations } = useContext(ApiClientContext);

  const [initialRows, setInitialRows] = useState<KitsuResource[]>([]);

  useEffect(() => {
    async function getData() {
      const operations: Operation[] = ids.map(id => ({
        op: "GET",
        path: findPath(id),
        value: {
          id,
          type
        }
      }));
      const responses = await doOperations(operations);

      const responseResources = (await Promise.all(
        responses.map(deserialise)
      )).map(res => res.data);

      setInitialRows(responseResources);
    }
    getData();
  }, [ids]);

  async function onSubmit(
    submittedValues: any[],
    { setStatus, setSubmitting }: FormikActions<KitsuResource[]>
  ) {
    const diffs = Object.values<any>(difference(submittedValues, initialRows));

    const serializedDiffs = await Promise.all(
      diffs.map(diff => serialize({ resource: diff, type }))
    );

    const operations: Operation[] = serializedDiffs.map<Operation>(diff => ({
      op: "PATCH",
      path: patchPath(diff.id),
      value: diff
    }));

    try {
      const responses = await doOperations(operations);
      setStatus(`${responses.length} rows updated.`);
    } catch (error) {
      setStatus(error.message);
      setSubmitting(false);
    }
    setSubmitting(false);
  }

  if (!initialRows.length) {
    return <LoadingSpinner loading={true} />;
  }

  return (
    <Formik initialValues={initialRows} onSubmit={onSubmit}>
      {({ isSubmitting, status }) => (
        <Form>
          {status && <div className="alert alert-info">{status}</div>}
          <ReactTable
            columns={columns}
            data={initialRows}
            showPaginationBottom={false}
            loading={isSubmitting}
            manual={true}
            pageSize={initialRows.length}
            sortable={false}
          />
          <SubmitButton />
        </Form>
      )}
    </Formik>
  );
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

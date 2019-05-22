import { FastField, FastFieldProps } from "formik";
import { Column } from "react-table";
import titleCase from "title-case";
import {
  ResourceSelect,
  ResourceSelectProps
} from "../resource-select/ResourceSelect";

interface ResourceSelectColumnParams<TData> extends ResourceSelectProps<TData> {
  // These props are not required when using this Formik-controlled input.
  onChange?: never;
  value?: never;
}

export function resourceSelectColumn<TData>(
  accessor: string,
  options: ResourceSelectColumnParams<TData>
): Column {
  return {
    Cell: ({ index }) => (
      <FastField name={`${index}.${accessor}`}>
        {({
          field: { name, value },
          form: { setFieldTouched, setFieldValue }
        }: FastFieldProps) => {
          function onChange(resource) {
            setFieldValue(name, resource);
            setFieldTouched(name);
          }

          return (
            <ResourceSelect
              {...options}
              onChange={onChange}
              styles={{ menu: () => ({ zIndex: 5 }) }}
              value={value}
            />
          );
        }}
      </FastField>
    ),
    Header: titleCase(accessor),
    accessor,
    minWidth: 200
  };
}

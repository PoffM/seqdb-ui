import { FastField, FastFieldProps } from "formik";
import Select from "react-select";
import { Column } from "react-table";
import titleCase from "title-case";
import {
  ResourceSelectProps,
  ResourceSelect
} from "../../components/resource-select/ResourceSelect";

interface SelectColumnParams {
  options: Array<{ label: string; value: any }>;
}

interface ResourceSelectColumnParams<TData> extends ResourceSelectProps<TData> {
  // These props are not required when using this Formik-controlled input.
  onChange?: never;
  value?: never;
}

export function stringColumn(accessor: string): Column {
  return {
    Cell: ({ index }) => (
      <FastField className="form-control" name={`${index}.${accessor}`} />
    ),
    Header: titleCase(accessor),
    accessor,
    minWidth: 200
  };
}

export function selectColumn(
  accessor: string,
  { options }: SelectColumnParams
): Column {
  return {
    Cell: ({ index }) => (
      <FastField name={`${index}.${accessor}`}>
        {({
          field: { name, value },
          form: { setFieldTouched, setFieldValue }
        }: FastFieldProps) => {
          function onChange({ value: selectValue }) {
            setFieldValue(name, selectValue);
            setFieldTouched(name);
          }

          return (
            <Select
              styles={{ menu: () => ({ zIndex: 5 }) }}
              options={options}
              onChange={onChange as any}
              value={options.find(option => option.value === value)}
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
            <ResourceSelect {...options} onChange={onChange} value={value} />
          );
        }}
      </FastField>
    ),
    Header: titleCase(accessor),
    accessor,
    minWidth: 200
  };
}

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
      <FastField name={`${index}.${accessor}`}>
        {({
          field: { name, value },
          form: { setFieldValue, setFieldTouched }
        }: FastFieldProps) => {
          function onChange(event) {
            setFieldValue(name, event.target.value);
            setFieldTouched(name);
          }

          // The default Field component's inner text input needs to be replaced with our own
          // controlled input that we manually pass the "onChange" and "value" props. Otherwise
          // we will get React's warning about switching from an uncontrolled to controlled input.
          return (
            <input
              className="form-control"
              name={name}
              onChange={onChange}
              type="text"
              value={value || ""}
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

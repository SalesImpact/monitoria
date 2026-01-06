declare module 'react-hook-form' {
  import type { ComponentType, ReactNode } from 'react';

  export type FieldValues = Record<string, any>;
  export type FieldPath<TFieldValues extends FieldValues> = string & keyof TFieldValues;
  export type FieldPathValue<TFieldValues extends FieldValues, TFieldPath extends FieldPath<TFieldValues>> = TFieldValues[TFieldPath];

  export interface ControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
  > {
    name: TName;
    control?: any;
    render: (props: {
      field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: TName;
        ref: (instance: any) => void;
      };
      fieldState: {
        invalid: boolean;
        isTouched: boolean;
        isDirty: boolean;
        error?: { message?: string };
      };
      formState: any;
    }) => ReactNode;
    defaultValue?: FieldPathValue<TFieldValues, TName>;
    rules?: any;
    shouldUnregister?: boolean;
    disabled?: boolean;
  }

  export const Controller: <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
  >(props: ControllerProps<TFieldValues, TName>) => ReactNode;

  export interface UseFormReturn<TFieldValues extends FieldValues = FieldValues> {
    control: any;
    handleSubmit: (onValid: (data: TFieldValues) => void) => (e?: any) => void;
    register: (name: FieldPath<TFieldValues>, options?: any) => any;
    watch: (name?: FieldPath<TFieldValues>) => any;
    setValue: (name: FieldPath<TFieldValues>, value: any) => void;
    getValues: () => TFieldValues;
    formState: {
      errors: Partial<Record<FieldPath<TFieldValues>, { message?: string }>>;
      isSubmitting: boolean;
      isValid: boolean;
      isDirty: boolean;
      touchedFields: Partial<Record<FieldPath<TFieldValues>, boolean>>;
    };
    reset: (values?: TFieldValues) => void;
    getFieldState: (name: FieldPath<TFieldValues>, formState: any) => {
      invalid: boolean;
      isTouched: boolean;
      isDirty: boolean;
      error?: { message?: string };
    };
  }

  export function useForm<TFieldValues extends FieldValues = FieldValues>(
    options?: any
  ): UseFormReturn<TFieldValues>;

  export function useFormContext<TFieldValues extends FieldValues = FieldValues>(): UseFormReturn<TFieldValues>;

  export interface FormProviderProps<TFieldValues extends FieldValues = FieldValues> {
    children: ReactNode;
    methods: UseFormReturn<TFieldValues>;
  }

  export const FormProvider: <TFieldValues extends FieldValues = FieldValues>(
    props: FormProviderProps<TFieldValues>
  ) => ReactNode;
}


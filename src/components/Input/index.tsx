import react, { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input as AntInput } from "antd";
import { ErrorMessage } from "../ErrorLabel";

interface InputProps {
    name: string
    label?: string
    required: boolean
    placeholder?: string
    allowClear?: boolean
    disabled?: boolean
    maxLength?: number
    minLength?: number
    type: string
    onPressEnter?: () => void
    style?: any
    containerStyle?: any
    defaultValue?: string
    autoComplete?: any
    prefix?: any
    labelColor?: string
    suffix?: any
}

export const Input = (props: InputProps) => {
    const { control, getFieldState } = useFormContext();
    const { labelColor, prefix, suffix, autoComplete, name, label, required, placeholder, allowClear, disabled = false, maxLength, minLength, type, onPressEnter, style, containerStyle, defaultValue } = props
    return (
        <Controller
            name={name}
            control={control}
            rules={{ required: !disabled ?? required }}
            render={({ field }) => (
                <div style={containerStyle}>
                    <label style={{ color: labelColor }}>{label} {required ? <>*</> : null}</label>
                    <AntInput
                        suffix={suffix}
                        prefix={prefix}
                        autoComplete="do-not-autofill"
                        {...field}
                        style={style}
                        type={type}
                        disabled={disabled}
                        allowClear={allowClear}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        minLength={minLength}
                        onPressEnter={onPressEnter}
                        status={getFieldState(name)?.error ? "error" : ""}
                        defaultValue={defaultValue}
                    />
                    {getFieldState(name)?.error && (
                        <ErrorMessage>{getFieldState(name)?.error?.message || `Campo obrigatório`}</ErrorMessage>
                    )}
                </div>
            )}
        />
    );
};

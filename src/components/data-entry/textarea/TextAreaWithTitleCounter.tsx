import { forwardRef, useCallback, useState } from "react";
import classNames from "classnames";

import { textareaClasses } from "./TextareaClasses";
import { TitleCounterProps } from "./TextareaWithTitleCounter.types";
import { Textarea } from ".";

export const TextAreaWithTitleCounter = forwardRef<
  HTMLTextAreaElement,
  TitleCounterProps
>((args, ref) => {
  const {
    style,
    label,
    isLight,
    showCount,
    required,
    readOnly,
    isError,
    direction,
    textLength,
    children,
    useFocus = true,
    ...inputProps
  } = args;
  const [count, setCount] = useState<number>();

  const rootClassName = classNames(
    textareaClasses.wrapper,
    args.className,
    "group",
  );
  const textareaClassName = classNames(textareaClasses.root, args.className, {
    invalid: isError,
    "group-focus-within:border-[var(--bc-primary-color-main)]":
      direction !== "inside",
  });

  const handleTextArea = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value?.length);
      return args.onChange?.(e);
    },
    [args, textLength],
  );

  return (
    <div className={rootClassName}>
      {direction && direction !== "bottom" ? (
        <div className={textareaClasses.titleCounterWrapper}>
          <span
            className={classNames(textareaClasses.label, { light: isLight })}
          >
            {label}
            {required && <span className="required"> *</span>}
          </span>
          {showCount && direction === "top" ? (
            <span
              className={classNames(`${textareaClasses.counter} ${direction}`)}
            >
              {textLength ? textLength : count || 0}
              {`/${args.maxLength}`}
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        className={classNames(
          `${textareaClasses.titleCounterWrapper} ${direction}`,
          { invalid: isError },
          useFocus && !args.disabled
            ? "ring-[var(--bc-primary-color-light)] group-focus-within:ring-2"
            : " group-focus-within:border-[var(--bc-border-color)]",
        )}
      >
        <Textarea
          {...inputProps}
          className={classNames(textareaClassName)}
          onChange={handleTextArea}
          placeholder={args.placeholder}
          maxLength={args.maxLength}
          ref={ref}
          readOnly={readOnly}
          autoComplete={args.autoComplete ? "true" : "false"}
          disabled={args.disabled}
          isError={isError}
          style={style}
          direction={direction}
          useFocus={useFocus}
        />

        {showCount && direction === "inside" ? (
          <div className={textareaClasses.insideWrapper}>
            <div className={textareaClasses.children}>{children}</div>
            <p className={`${textareaClasses.counter} ${direction}`}>
              {textLength ? textLength : count || 0}
              {`/${args.maxLength}`}
            </p>
          </div>
        ) : null}
      </div>
      {direction === "bottom" ? (
        <div className={`${textareaClasses.titleCounterWrapper}`}>
          <span
            className={classNames(textareaClasses.label, { light: isLight })}
          >
            {label}
            {required && <span className="required"> *</span>}
          </span>
          {showCount && direction === "bottom" ? (
            <span
              className={classNames(`${textareaClasses.counter} ${direction}`)}
            >
              {textLength ? textLength : count || 0}
              {`/${args.maxLength}`}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

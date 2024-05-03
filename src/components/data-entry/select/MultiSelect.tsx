import React, { ReactElement, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { usePopper } from "react-popper";
import IcArrow from "@assets/icons/ic_select_arrow.svg?react";
import { Input } from "@components/data-entry/input";
import { useOutsideClick } from "@hooks/useOutsideClick";
import { AnyObject } from "@models/types/AnyObject";
import { remUtil } from "@modules/utils/rem";
import classNames from "classnames";

import { Checkbox } from "../checkbox/Checkbox";

import { IMultipleSelectProp } from "./Select.types";
import { selectClasses } from "./SelectClasses";

function MultiSelectFunc<T extends AnyObject>(
  props: IMultipleSelectProp<T>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const {
    onChange,
    fullWidth,
    value,
    bordered,
    defaultOpen,
    defaultValue,
    disabled,
    placeholder,
    placement = "bottom",
    open,
    offset = [0, 0],
    status,
    suffixIcon,
    options,
    displayLabel,
    valuePath,
    items,
    selectWidth = 150,
    listWidth = 150,
    controlSize = "md",
    isError,
    limitNumber,
    isCheckbox,
    preSuffixIcon,
    className,
    style,
    ...inputProps
  } = props;
  const tempWidth =
    typeof selectWidth !== "number"
      ? remUtil.findNumber(selectWidth)
      : selectWidth;
  const width = `${tempWidth}px`;
  const tempListWidth =
    typeof listWidth !== "number" ? remUtil.findNumber(listWidth) : listWidth;
  const tmpListWidth = tempListWidth < 150 ? "150px" : `${tempListWidth}px`;

  const [init, setInit] = useState(false);
  const [list, setList] =
    useState<Array<{ label: string; value: string; disabled?: boolean }>>();
  const [tmpList, setTmpList] =
    useState<Array<{ label: string; value: string; disabled?: boolean }>>();
  const [currentValue, setCurrentValue] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState<boolean>(defaultOpen ?? false);
  const [hoverText, setHoverText] = useState<string>(""); //색칠...
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [indexNum, setIndexNum] = useState<number>(0);
  const [inputFocus, setInputFocus] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popperUl = useRef<HTMLUListElement>(null);
  const referenceDiv = useRef<HTMLDivElement>(null);
  const { styles, attributes, update } = usePopper(
    referenceDiv.current,
    popperUl.current,
    {
      placement: placement,

      modifiers: [
        {
          name: "offset",
          options: {
            offset: offset,
          },
        },
      ],

      strategy: "fixed",
    },
  );

  const popperUpdate = () => {
    void update?.();
  };

  const onChangeCurrentValue = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const text = (e.target as HTMLElement).innerText;
    onChangeValue(text);
    setShowOptions(true);
    inputRef.current?.focus();
  };

  const findUserValue = (value: string[]) => {
    const result: string[] = [];
    list
      ?.filter((x) => {
        return value.includes(x.label);
      })
      .map((x) => result.push(x.value));
    onChange?.(result ?? null);
  };

  const onChangeValue = (text: string) => {
    if (text === "") {
      return;
    }
    if (Array.isArray(currentValue) && currentValue.length >= 0) {
      if (currentValue.includes(text)) {
        const value: string[] = currentValue.filter(
          (value: string) => value.toLowerCase() !== text.toLowerCase(),
        );
        findUserValue(value);
        setCurrentValue(value);
      } else {
        if (
          (limitNumber && limitNumber > currentValue.length) ||
          !limitNumber
        ) {
          const value: string[] = [...currentValue, text];
          setCurrentValue(value);
          findUserValue(value);
        }
      }
    }
    popperUpdate();
  };

  const handleKeyArrow = (e: React.KeyboardEvent) => {
    let flag = false;

    switch (e.code) {
      case "ArrowDown":
        e.preventDefault();
        popperUpdate();
        if (!showOptions) {
          setShowOptions((pre) => !pre);
          break;
        }

        setIndexNum((idx) => idx + 1);

        if (
          popperUl.current &&
          popperUl.current.childElementCount <= indexNum + 1
        ) {
          setIndexNum(0);
          flag = true;
        }
        list?.map((x, idx) => {
          if (idx === indexNum + 1) {
            setHoverText(x.label);
          }
        });
        if (flag) {
          setHoverText(list ? list[0].label : "");
          flag = false;
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        popperUpdate();
        if (!showOptions) {
          setShowOptions((pre) => !pre);
          break;
        }
        setIndexNum((idx) => idx - 1);
        if (indexNum <= 0) {
          const tmpNum = list ? list.length - 1 : 0;
          setIndexNum(tmpNum);
          flag = true;
        }

        list?.map((x, idx) => {
          if (idx === indexNum - 1) {
            setHoverText(x.label);
          }
        });
        if (flag) {
          setHoverText(list ? list[list.length - 1].label : "");
          flag = false;
        }
        break;
      case "Escape":
        e.preventDefault();
        setHoverText("");
        setIndexNum(0);
        setSearchKeyword("");
        setShowOptions(false);
        break;
      case "Enter":
        e.preventDefault();
        if (!showOptions) {
          setShowOptions(true);
        } else {
          if (list && list.length > 0) {
            onChangeValue(hoverText);
            setSearchKeyword("");
            setList(tmpList);
          }
        }
        popperUpdate();
        break;
      case "Backspace":
        if (!searchKeyword) {
          e.preventDefault();
          if (Array.isArray(currentValue) && currentValue.length > 0) {
            const text: string = currentValue[currentValue.length - 1];
            onChangeValue(text);
          }
        }
        break;
      case "Tab":
        setInputFocus(false);
        setShowOptions(false);
        break;
    }
  };
  const iconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      if (!showOptions) {
        setShowOptions(true);
        popperUpdate();
      } else {
        setSearchKeyword("");
        setList(tmpList);
        setShowOptions(false);
      }
      setInputFocus(true);
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  };

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowOptions(true);
    popperUpdate();
    if (e.target.value.trim() === "") {
      setList(tmpList);
      setSearchKeyword("");
      return;
    }
    setSearchKeyword(e.target.value.trim());
    const searchList = tmpList
      ? tmpList.filter((element) =>
          element.label
            .toLowerCase()
            .includes(e.target.value.toLowerCase().trim()),
        )
      : [];
    setList(searchList);

    setHoverText(searchList?.length ? searchList[0].label : "");
    // const findNum = searchList.findIndex((x) => !x.disabled);
    // setHoverText(findNum !== -1 ? searchList[findNum].label : '');
  };

  const selectedClass = (x: string, y?: boolean) => {
    console.log(y);
    const value =
      Array.isArray(currentValue) &&
      currentValue.length > 0 &&
      currentValue.includes(x)
        ? selectClasses.list.item
        : "";
    return value;
  };

  const closeIconClick = (e: React.MouseEvent<HTMLElement>, text: string) => {
    e.stopPropagation();
    if (Array.isArray(currentValue) && currentValue.length > 0) {
      onChangeValue(text);
    }
    inputRef.current?.focus();
  };

  useOutsideClick(
    selectRef,
    () => {
      popperUpdate();
      setInputFocus(false);
      setShowOptions(false);
      setSearchKeyword("");
      setList(tmpList);
    },
    "mousedown",
  );

  useEffect(() => {
    if (options) {
      setList(options ?? []);
      setTmpList(options ?? []);
      const index = options.findIndex((x) => !x.disabled);
      if (hoverText === "") {
        if (index > -1) {
          setHoverText(options[index].label);
          setIndexNum(index);
        } else {
          setHoverText("");
        }
      }
      if (defaultValue) {
        if (Array.isArray(defaultValue)) {
          const label = defaultValue.map((x) => {
            const tmp = options?.filter((k) => k.value === x);
            if (tmp.length > 0) return tmp[0].label;
            else return x;
          });

          setCurrentValue(label);
        } else {
          const tmp = options?.find((x) => x.value === defaultValue);
          const label = tmp ? tmp.label : defaultValue;

          setCurrentValue([label]);
        }
      }
    } else {
      const key = displayLabel ?? "label";
      const valueKey = valuePath ?? "value";
      const temp =
        (items?.map((x) => ({
          label: x[key],
          value: x[valueKey],
          disabled: x["disabled"],
        })) as Array<{ label: string; value: string; disabled?: boolean }>) ??
        [];

      setList(temp ?? []);
      setTmpList(temp ?? []);
      if (defaultValue) {
        if (Array.isArray(defaultValue)) {
          const label = defaultValue.map((x) => {
            const tmp = temp?.filter((k) => k.value === x);
            if (tmp.length > 0) return tmp[0].label;
            else return x;
          });

          setCurrentValue(label);
        } else {
          const tmp = temp?.filter((x) => x.value === defaultValue);
          const label = tmp.length > 0 ? tmp[0].label : defaultValue;

          setCurrentValue([label]);
        }
      }
      setHoverText(temp && temp.length > 0 ? temp[0].label : "");
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(value)) {
      const label = value.map((x) => {
        const tmp = tmpList?.find((k) => k.value === x);
        if (tmp) return tmp.label;
        else return x;
      });

      setCurrentValue(label);
    } else {
      const findValue = tmpList?.find((x) => x.value === value);
      setCurrentValue(findValue ? [findValue.label] : []);
    }
  }, [value]);

  useEffect(() => {
    setInit(true);
  }, []);

  const rootClassName = classNames(
    selectClasses.root,
    selectClasses.multiSelect.root,
    {
      "w-full": fullWidth,
    },
    {
      [selectClasses.normal.sm]: controlSize === "sm",
      [selectClasses.normal.md]: controlSize === "md",
      [selectClasses.normal.lg]: controlSize === "lg",
    },
  );

  const selectClassName = classNames(
    selectClasses.referenceElement,
    {
      [selectClasses.disabled]: disabled,
      [selectClasses.status.error]: status === "error" || isError,
      [selectClasses.status.warning]: status === "warning",
    },

    bordered === false
      ? selectClasses.bordered.borderedNone
      : selectClasses.bordered.root,
  );

  const focusClassName = classNames(
    inputFocus && !status
      ? selectClasses.focus.root
      : selectClasses.focus.focusNone,
  );

  const disabledLiClassName = classNames(
    selectClasses.list.overflow,
    selectClasses.disabled,
    selectClasses.list.disabled,
  );
  const fontClassName = classNames({
    [selectClasses.list.font.sm]: controlSize === "sm",
    [selectClasses.list.font.md]: controlSize === "md",
    [selectClasses.list.font.lg]: controlSize === "lg",
  });
  return (
    <div
      className={classNames(rootClassName, focusClassName)}
      ref={selectRef}
      onMouseDown={(e) => {
        {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div
        ref={referenceDiv}
        style={{
          ...style,
          minWidth: width,
        }}
        onClick={iconClick}
        className={classNames(selectClassName, className, "group")}
      >
        <div className={classNames(selectClasses.multiSelect.tag.area)}>
          <span className={classNames(selectClasses.multiSelect.icon.prefix)}>
            {preSuffixIcon}
          </span>
          {Array.isArray(currentValue) && currentValue.length > 0 ? (
            currentValue.map((x: string) => (
              <span
                key={x}
                className={classNames(selectClasses.multiSelect.tag.root)}
              >
                <span className={fontClassName} key={x}>
                  {x}
                </span>
                <span
                  onClick={(e) => closeIconClick(e, x)}
                  className={classNames(
                    selectClasses.multiSelect.tag.closeIcon,
                  )}
                >
                  &#88;
                </span>
              </span>
            ))
          ) : (
            <></>
          )}
          <div className={classNames(selectClasses.multiSelect.inputArea)}>
            <span>{searchKeyword}</span>
            <Input
              className={classNames({
                [selectClasses.disabled]: disabled,
              })}
              value={searchKeyword}
              controlSize={controlSize}
              type="text"
              {...inputProps}
              ref={(current) => {
                if (ref) {
                  if (typeof ref === "function") {
                    ref(current);
                  } else {
                    ref.current = current;
                  }
                }
                inputRef.current = current;
              }}
              onFocus={() => setInputFocus(true)}
              onBlur={() => {
                setInputFocus(false);
                setShowOptions(false);
              }}
              disabled={disabled}
              onChange={inputOnChange}
              onKeyDown={handleKeyArrow}
              useFocus={false}
            />
          </div>
          {!searchKeyword &&
            Array.isArray(currentValue) &&
            currentValue.length === 0 && (
              <span
                className={classNames({
                  [selectClasses.placeholder]:
                    placeholder &&
                    Array.isArray(currentValue) &&
                    currentValue.length === 0,
                })}
              >
                {placeholder}
              </span>
            )}
        </div>

        {suffixIcon ? (
          <div
            className={classNames(
              disabled
                ? selectClasses.multiSelect.icon.disabled
                : selectClasses.multiSelect.icon.root,
            )}
          >
            {suffixIcon}
          </div>
        ) : (
          <div
            className={classNames(
              disabled
                ? selectClasses.multiSelect.icon.disabled
                : selectClasses.multiSelect.icon.root,
            )}
          >
            <IcArrow />
          </div>
        )}
      </div>

      {ReactDOM.createPortal(
        <ul
          {...attributes.popper}
          style={{
            ...styles.popper,
            ...style,
            width: tmpListWidth,
            visibility:
              open === undefined
                ? showOptions && init
                  ? "visible"
                  : "hidden"
                : open && init
                  ? "visible"
                  : "hidden",
            margin:
              placement === "left" || placement === "right" ? "0 8px" : "8px 0",
          }}
          ref={popperUl}
          className={classNames(selectClasses.list.root)}
        >
          {list && list.length > 0 ? (
            list.map((x, idx) => {
              return !x.disabled ? (
                <li
                  role="option"
                  key={x.label}
                  onMouseDown={onChangeCurrentValue}
                  onMouseEnter={(e) => {
                    setHoverText(e.currentTarget.innerText);
                    setIndexNum(idx);
                  }}
                  onMouseLeave={() => {
                    !showOptions && setHoverText("");
                    setIndexNum(idx);
                  }}
                  className={classNames(
                    Array.isArray(currentValue) &&
                      currentValue.length > 0 &&
                      currentValue.includes(x.label)
                      ? selectedClass(x.label)
                      : {
                          [selectClasses.list.item]:
                            x.label === currentValue[0],
                        },
                    { [selectClasses.list.hover]: x.label === hoverText },
                    selectClasses.list.overflow,
                    fontClassName,
                  )}
                >
                  {isCheckbox && (
                    <Checkbox checked={currentValue.includes(x.label)} />
                  )}
                  {x.label}
                </li>
              ) : (
                <li
                  key={x.label}
                  role="option"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className={classNames(disabledLiClassName, fontClassName)}
                >
                  {x.label}
                </li>
              );
            })
          ) : (
            <li
              role="option"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className={classNames(fontClassName)}
            >
              No data
            </li>
          )}
        </ul>,
        document.querySelector("body")!,
      )}
    </div>
  );
}
export const MultiSelect = React.forwardRef(MultiSelectFunc) as <
  T extends object,
>(
  props: IMultipleSelectProp<T> & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  },
) => ReactElement;

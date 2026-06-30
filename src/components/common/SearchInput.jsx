import React, { forwardRef } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchInput = forwardRef(({
    value,
    onChange,
    placeholder = 'Search...',
    wrapperStyle = {},
    wrapperClassName = '',
    inputStyle = {},
    inputClassName = '',
    ...props
}, ref) => {
    return (
        <div className={`search-input-wrapper relative flex items-center ${wrapperClassName}`} style={wrapperStyle}>
            <FaSearch className="absolute left-3 text-slate-400 rtl:right-3 rtl:left-auto" />
            <input
                ref={ref}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border-[1.5px] border-slate-200 rounded-md outline-none transition-all hover:border-slate-300 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/15 ${inputClassName}`}
                style={{ paddingLeft: 40, ...inputStyle }}
                {...props}
            />
        </div>
    );
});

export default SearchInput;

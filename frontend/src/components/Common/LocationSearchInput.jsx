import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import api from '../../services/api';
import styles from './LocationSearchInput.module.css';

const unwrapList = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
};

const LocationSearchInput = ({
    initialValue = '',
    onChange,
    onSelectLocation,
    onPickOnMap,
    isActiveMapPick = false,
    placeholder = 'Nhập địa chỉ, bến xe, địa danh...',
    autocompletePath = '/admin/station/location/autocomplete',
    /** 'name' = hiển thị tên sau khi chọn (Station); 'address' = hiển thị địa chỉ (Route) */
    valueOnSelect = 'address',
}) => {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showEmpty, setShowEmpty] = useState(false);
    const [menuPos, setMenuPos] = useState(null);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    const measureMenuPos = useCallback(() => {
        if (!inputRef.current) return null;
        const rect = inputRef.current.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return null;
        return {
            top: rect.bottom + 4,
            left: rect.left,
            width: Math.max(rect.width, 280),
        };
    }, []);

    const syncMenuPos = useCallback(() => {
        const pos = measureMenuPos();
        if (pos) setMenuPos(pos);
        return pos;
    }, [measureMenuPos]);

    useLayoutEffect(() => {
        if (isOpen || showEmpty) {
            syncMenuPos();
            const onReposition = () => syncMenuPos();
            window.addEventListener('resize', onReposition);
            window.addEventListener('scroll', onReposition, true);
            return () => {
                window.removeEventListener('resize', onReposition);
                window.removeEventListener('scroll', onReposition, true);
            };
        }
    }, [isOpen, showEmpty, suggestions.length, syncMenuPos]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current?.contains(event.target)) return;
            const portal = document.getElementById('location-autocomplete-portal');
            if (portal?.contains(event.target)) return;
            setIsOpen(false);
            setShowEmpty(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            const trimmed = query?.trim() || '';
            if (trimmed.length < 2) {
                setSuggestions([]);
                setIsOpen(false);
                setShowEmpty(false);
                return;
            }

            setLoading(true);
            setShowEmpty(false);
            try {
                const res = await api.get(autocompletePath, {
                    params: { q: trimmed, _: Date.now() },
                    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
                });
                const list = unwrapList(res);
                setSuggestions(list);
                setIsOpen(list.length > 0);
                setShowEmpty(list.length === 0);
                syncMenuPos();
            } catch (error) {
                console.error('Autocomplete error:', error);
                setSuggestions([]);
                setIsOpen(false);
                setShowEmpty(false);
            } finally {
                setLoading(false);
            }
        };

        const timerId = setTimeout(fetchSuggestions, 350);
        return () => clearTimeout(timerId);
    }, [query, autocompletePath, syncMenuPos]);

    const handleSelect = (sg) => {
        const displayValue = valueOnSelect === 'name' ? sg.name : sg.address;
        setQuery(displayValue);
        setIsOpen(false);
        setShowEmpty(false);
        setSuggestions([]);
        onChange?.(displayValue);
        onSelectLocation({
            name: sg.name,
            address: sg.address,
            lat: sg.lat,
            lng: sg.lng,
        });
    };

    const shouldShowList = isOpen && suggestions.length > 0;
    const shouldShowEmpty = !loading && showEmpty;
    const shouldShowDropdown = shouldShowList || shouldShowEmpty;
    const dropdownPos = menuPos ?? measureMenuPos();

    const dropdownPortal =
        shouldShowDropdown && dropdownPos
            ? createPortal(
                  <div
                      id="location-autocomplete-portal"
                      className={styles.portalRoot}
                      style={{
                          position: 'fixed',
                          top: dropdownPos.top,
                          left: dropdownPos.left,
                          width: dropdownPos.width,
                          zIndex: 99999,
                      }}
                  >
                      {shouldShowList && (
                          <ul className={styles.suggestionsList}>
                              {suggestions.map((sg, index) => (
                                  <li
                                      key={`${sg.lat}-${sg.lng}-${sg.address}-${index}`}
                                      className={styles.suggestionItem}
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => handleSelect(sg)}
                                  >
                                      <strong>{sg.name}</strong>
                                      <small>{sg.address}</small>
                                  </li>
                              ))}
                          </ul>
                      )}
                      {shouldShowEmpty && (
                          <div className={styles.emptyText}>Không tìm thấy địa điểm phù hợp</div>
                      )}
                  </div>,
                  document.body,
              )
            : null;

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <div className={styles.inputRow}>
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.input}
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange?.(e.target.value);
                    }}
                    onFocus={() => syncMenuPos()}
                />
                {onPickOnMap && (
                    <button
                        type="button"
                        className={`${styles.mapPickBtn} ${isActiveMapPick ? styles.mapPickBtnActive : ''}`}
                        onClick={onPickOnMap}
                        title="Chọn trên bản đồ"
                    >
                        <FaMapMarkerAlt />
                    </button>
                )}
            </div>

            {loading && <div className={styles.loadingText}>Đang tìm kiếm...</div>}
            {dropdownPortal}
        </div>
    );
};

export default LocationSearchInput;

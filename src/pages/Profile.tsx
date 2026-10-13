import React, { useEffect, useRef, useState } from 'react';
import { createRecommendations } from '../api/recommendations';
import assets from '../assets.json';
import { certificates } from '../api/certificates';
import { exams, initialCalendar } from '../api/calendar';
import { getInterestCategories, type InterestCategory, educationOptions, educationStatusOptions } from '../api/profile';
import { useAppContext } from '../AppContext';
import { Button } from '../components/Button';
import { Icon, OutlineIcon } from '../components/Icons';
import { FavoriteCard } from '../components/FavoriteCard';
import { CalendarRows, SmallTitle } from '../components/PageHelpers';

export default function Profile() {
  const {
    page, logged, setLogged, selected, setSelected, favorites, setFavorites,
    calendar, setCalendar, search, setSearch, submitted, setSubmitted,
    category, setCategory, more, setMore, returnPage, setReturnPage, profile,
    setProfile, setRecommendationResult, calendarKey, setCalendarKey, examType, setExamType, round,
    setRound, toast, setToast, dialog, setDialog, favoriteSearch,
    setFavoriteSearch, sort, setSort, go, protectedGo, openDetail,
    toggleFavorite, openCalendar, calendarId, cert, registered, register,
  } = useAppContext();
  const [fields, setFields] = useState<InterestCategory[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [fieldsError, setFieldsError] = useState('');
  const [fieldsRequest, setFieldsRequest] = useState(0);
  const [saving, setSaving] = useState(false);
  const requestPending = useRef(false);
  const [saveError, setSaveError] = useState('');
  const selectedCode = String(profile.field + 1).padStart(2, '0');
  const selectedField = fields.find(field => field.code === selectedCode);

  useEffect(() => {
    const controller = new AbortController();
    setFieldsLoading(true);
    setFieldsError('');
    getInterestCategories(controller.signal)
      .then(data => {
        if (!controller.signal.aborted) setFields(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFieldsError('관심 분야를 불러오지 못했습니다. 다시 시도해주세요.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setFieldsLoading(false);
      });
    return () => controller.abort();
  }, [fieldsRequest]);

  return (
    <main className="profile-main">
      <h1>내 조건으로 찾기</h1>
      <p className="muted">별도 추가 질문 화면 없이 필요한 입력을 이 화면에서 펼쳐 보여줍니다.</p>
      <form
        onSubmit={async e => {
          e.preventDefault();
          if (requestPending.current) return;
          if (!selectedField || fieldsLoading || fieldsError) {
            setToast('관심 분야를 불러온 후 선택해주세요.');
            return;
          }
          if (!educationOptions.some(option => option.value === profile.education) ||
              !educationStatusOptions.some(option => option.value === profile.educationStatus)) {
            setToast('최종 학력·졸업 상태를 입력해 주세요.');
            return;
          }
          if (profile.experience && (!profile.years || !Number.isFinite(Number(profile.years)) ||
              Number(profile.years) < 0 || Number(profile.years) > 80)) {
            setToast('관련 직무 년차를 입력해 주세요.');
            return;
          }
          requestPending.current = true;
          setSaving(true);
          setSaveError('');
          try {
            const result = await createRecommendations(profile);
            setRecommendationResult(result);
            go('related');
          } catch (error) {
            setSaveError(error instanceof Error ? error.message : '추천 자격증을 불러오지 못했습니다.');
          } finally {
            requestPending.current = false;
            setSaving(false);
          }
        }}
      >
        <label className="field-label">관심 분야 *</label>
        <div className="field-placeholder">
          {selectedField ? `${selectedField.code} ${selectedField.name}` : '관심 분야를 선택해주세요'}
        </div>
        {fieldsError && (
          <div className="field-feedback" role="alert">
            <span>{fieldsError}</span>
            <button type="button" onClick={() => setFieldsRequest(value => value + 1)}>다시 시도</button>
          </div>
        )}
        <div className="field-grid" role="radiogroup" aria-label="관심 분야" aria-busy={fieldsLoading}>
          {fieldsLoading && <p className="field-status" role="status">관심 분야를 불러오는 중입니다.</p>}
          {!fieldsLoading && !fieldsError && fields.map(field => (
            <button
              key={field.code}
              type="button"
              role="radio"
              aria-checked={selectedCode === field.code}
              className={selectedCode === field.code ? 'chosen' : ''}
              onClick={() => setProfile({ ...profile, field: Number(field.code) - 1 })}
            >
              <span className="field-code">{field.code}</span>
              <span className="field-name">{field.name}</span>
            </button>
          ))}
        </div>
        <div className="profile-grid">
          <label>
            최종 학력 *
            <select
              required
              value={educationOptions.some(option => option.value === profile.education) ? profile.education : ''}
              onChange={e => setProfile({ ...profile, education: e.target.value })}
            >
              <option value="" disabled>최종 학력을 선택해주세요</option>
              {educationOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            졸업 상태 *
            <select required value={profile.educationStatus || ''}
              onChange={e => setProfile({ ...profile, educationStatus: e.target.value })}>
              <option value="" disabled>졸업 상태를 선택해주세요</option>
              {educationStatusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            전공 · 선택
            <input
              value={profile.major}
              onChange={e => setProfile({ ...profile, major: e.target.value })}
              placeholder="직접 입력 (없을 시 빈칸)"
            />
          </label>
          <fieldset className="profile-career">
            <legend>관련 경력 *</legend>
            <div className="experience">
              {[true, false].map(v => (
                <button
                  key={String(v)}
                  type="button"
                  aria-pressed={profile.experience === v}
                  className={profile.experience === v ? 'chosen' : ''}
                  onClick={() => setProfile({ ...profile, experience: v, years: v ? profile.years : '' })}
                >
                  {v ? '있어요' : '없어요'}
                </button>
              ))}
            </div>
          </fieldset>
          <label>
            관련 직무 년차 *
            <div className="years">
              <input
                aria-label="관련 직무 년차"
                type="number"
                min="0"
                max="80"
                step="1"
                required={profile.experience}
                placeholder="ex) 3"
                disabled={!profile.experience}
                value={profile.years}
                onChange={e => setProfile({ ...profile, years: e.target.value })}
              />
              <span>년(연)</span>
            </div>
          </label>
        </div>
        {saveError && <p className="field-feedback" role="alert">{saveError}</p>}
        <Button type="submit" className="primary profile-submit" disabled={saving || fieldsLoading} aria-busy={saving}>
          {saving ? '추천 자격증을 불러오는 중…' : '저장하고 관련 자격증 보기'}
        </Button>
      </form>
    </main>
  );
}

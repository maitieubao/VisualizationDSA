import type { ClassDefinition, AccessCheckResult } from '../types/oop-sandbox.types';

export function isSubclass(
  classA: string,
  classB: string,
  getClass: (name: string) => ClassDefinition | undefined
): boolean {
  let current = getClass(classA);
  while (current?.parentClass) {
    if (current.parentClass === classB) return true;
    current = getClass(current.parentClass);
  }
  return false;
}

export function checkAccess(
  targetClass: string,
  memberName: string,
  accessingClass: string | undefined,
  getClass: (name: string) => ClassDefinition | undefined
): AccessCheckResult {
  const classDef = getClass(targetClass);
  if (!classDef) {
    return { allowed: false, violation: true, message: `Lớp ${targetClass} không tồn tại`, modifier: 'PRIVATE' };
  }

  const member = classDef.members.find((m) => m.name === memberName);
  if (!member) {
    if (classDef.parentClass) {
      return checkAccess(classDef.parentClass, memberName, accessingClass, getClass);
    }
    return { allowed: false, violation: true, message: `Thành viên ${memberName} không tồn tại`, modifier: 'PRIVATE' };
  }

  const mod = member.accessModifier;
  if (mod === 'PUBLIC') return { allowed: true, violation: false, message: 'Truy cập công khai', modifier: mod };
  if (mod === 'PROTECTED') {
    const allowed = !accessingClass || accessingClass === targetClass || isSubclass(accessingClass, targetClass, getClass);
    return {
      allowed,
      violation: !allowed,
      modifier: mod,
      message: allowed ? 'Truy cập protected được phép' : `VI PHẠM: Không thể truy cập protected member ${memberName}`,
    };
  }
  
  const allowedPrivate = accessingClass === targetClass;
  return {
    allowed: allowedPrivate,
    violation: !allowedPrivate,
    modifier: mod,
    message: allowedPrivate
      ? 'Truy cập private trong cùng class'
      : `VI PHẠM ĐÓNG GÓI: Không thể truy cập private member ${memberName} từ bên ngoài!`,
  };
}

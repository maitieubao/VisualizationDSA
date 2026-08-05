import { describe, it, expect } from 'vitest';
import { translateCompileError } from '../engine/compileErrorTranslator';

describe('compileErrorTranslator', () => {
  it('translates syntax errors into Vietnamese hints', () => {
    const out = translateCompileError('Unexpected token \'else\'');
    expect(out).toContain('Lỗi cú pháp JavaScript');
    expect(out).toContain('Unexpected token');
  });

  it('translates step-limit errors', () => {
    const out = translateCompileError('Vượt quá giới hạn thực thi (tối đa 10000 bước). Có thể có vòng lặp vô hạn!');
    expect(out).toContain('10.000 bước');
  });

  it('translates loop-limit errors', () => {
    const out = translateCompileError('Vượt quá giới hạn lặp (tối đa 1000000 vòng). Có thể có vòng lặp vô hạn!');
    expect(out).toContain('1.000.000');
  });

  it('translates undefined access errors', () => {
    const out = translateCompileError("TypeError: Cannot read properties of undefined (reading 'push')");
    expect(out).toContain('undefined');
    expect(out).toContain('chỉ số mảng');
  });

  it('translates function-call errors', () => {
    const out = translateCompileError('foo is not a function');
    expect(out).toContain('Gọi hàm không tồn tại');
  });

  it('translates duplicate declaration errors', () => {
    const out = translateCompileError("Identifier 'x' has already been declared");
    expect(out).toContain('Khai báo biến trùng tên');
  });

  it('keeps Vietnamese validation messages as-is', () => {
    const msg = "Giá trị 'abc' không phải là số hợp lệ!";
    expect(translateCompileError(msg)).toBe(msg);
  });

  it('keeps compile-timeout messages as-is', () => {
    const msg = 'Hết thời gian biên dịch (15s). Code quá nặng hoặc có vòng lặp vô hạn!';
    expect(translateCompileError(msg)).toBe(msg);
  });

  it('passes through unknown messages unchanged', () => {
    const msg = 'Something unexpected happened';
    expect(translateCompileError(msg)).toBe(msg);
  });
});

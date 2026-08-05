// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import CourseCover from '../components/CourseCover.vue';

function mountCover(course: { id: string; title: string; category?: string }): VueWrapper {
  return mount(CourseCover, {
    props: { course },
  });
}

describe('CourseCover.vue — ảnh bìa SVG thay thế ảnh bitmap', () => {
  it('render <svg> với aria-label đúng tên khóa học', () => {
    const wrapper = mountCover({ id: 'sorting-101', title: 'Thuật toán Sắp xếp Cơ bản', category: 'Sorting' });
    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.attributes('aria-label')).toContain('Thuật toán Sắp xếp Cơ bản');
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('gradient id duy nhất theo course id (không xung đột giữa nhiều card)', () => {
    const a = mountCover({ id: 'sorting-101', title: 'A', category: 'Sorting' });
    const b = mountCover({ id: 'course-2', title: 'B', category: 'Searching' });
    const gradA = a.find('linearGradient').attributes('id');
    const gradB = b.find('linearGradient').attributes('id');
    expect(gradA).toContain('sorting-101');
    expect(gradB).toContain('course-2');
    expect(gradA).not.toBe(gradB);
  });

  it('theme theo danh mục (Sorting → indigo/violet)', () => {
    const wrapper = mountCover({ id: 'c1', title: 'Sort', category: 'Sorting' });
    const stops = wrapper.findAll('stop').map(s => s.attributes('stop-color'));
    expect(stops[0]).toBe('#6366f1');
    expect(stops[1]).toBe('#8b5cf6');
  });

  it('theme fallback khi danh mục không xác định', () => {
    const wrapper = mountCover({ id: 'c2', title: 'Lạ', category: 'WeirdCategory' });
    const stops = wrapper.findAll('stop').map(s => s.attributes('stop-color'));
    expect(stops[0]).toBe('#334155');
  });

  it('icon theo danh mục: Searching → kính lúp (circle), Tree → nodes, OOP → cột', () => {
    const search = mountCover({ id: 'c3', title: 'S', category: 'Searching' });
    // Circle kính lúp không có fill riêng (kế thừa fill="none" từ group)
    expect(search.findAll('circle').some(c => !c.attributes('fill'))).toBe(true);

    const tree = mountCover({ id: 'c4', title: 'T', category: 'Tree/Graph' });
    expect(tree.findAll('circle').length).toBeGreaterThanOrEqual(5);

    const oop = mountCover({ id: 'c5', title: 'O', category: 'OOP' });
    expect(oop.findAll('rect[opacity]').length).toBeGreaterThanOrEqual(4);
  });

  it('badge hiển thị tên danh mục viết hoa', () => {
    const wrapper = mountCover({ id: 'c6', title: 'X', category: 'DataStructure' });
    expect(wrapper.find('text').text()).toBe('DATASTRUCTURE');
  });

  it('chấp nhận DTO course detail (chỉ id/title/category)', () => {
    const wrapper = mountCover({ id: '61ee2ff5-c462-45d0-8849-f700a13927d5', title: 'Nhập môn', category: 'DataStructure' });
    expect(wrapper.find('svg').exists()).toBe(true);
  });
});

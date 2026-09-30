import type { IBreadcrumbItem } from "../types";

import { BoundedList, sentry } from "../utils";

class Breadcrumb extends BoundedList<IBreadcrumbItem> {
  override push(data: IBreadcrumbItem): void {
    const { beforeBreadcrumb } = sentry.options;
    super.push(beforeBreadcrumb ? beforeBreadcrumb(data) : data);
  }
}

const breadcrumb = new Breadcrumb();

export default breadcrumb;

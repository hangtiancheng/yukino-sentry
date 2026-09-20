/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { BreadcrumbType, EventType } from "../types";

function event2breadcrumb(type: EventType) {
  switch (type) {
    case EventType.Xhr:
    case EventType.Fetch: {
      return BreadcrumbType.Http;
    }

    case EventType.Click: {
      return BreadcrumbType.Click;
    }

    case EventType.HashChange:
    case EventType.History: {
      return BreadcrumbType.Route;
    }

    case EventType.Resource: {
      return BreadcrumbType.Resource;
    }

    case EventType.UnhandledRejection: {
      return BreadcrumbType.CodeError;
    }

    case EventType.Error:
    case EventType.Vue:
    case EventType.React: {
      return BreadcrumbType.CodeError;
    }

    case EventType.Performance:
    case EventType.ScreenRecord:
    case EventType.WhiteScreen:
    case EventType.Custom: {
      return BreadcrumbType.Custom;
    }

    default: {
      return BreadcrumbType.Custom;
    }
  }
}

export default event2breadcrumb;

/*
 * Copyright 2011-2012 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var vertx = vertx || {};

if (!vertx.createHttpServer) {

  (function() {
    
    load("core/read_stream.js");
    load("core/write_stream.js");

    function wrappedRequestHandler(handler) {
      return function(jreq) {

        //We need to add some functions to the request and the response

        var reqHeaders = null;
        var reqParams = null;

        var req = {};
        readStream(req, jreq);
        req.method = function() {
          return jreq.method();
        };
        req.uri = function() {
          return jreq.uri();
        };
        req.path = function() {
          return jreq.path();
        };
        req.query = function() {
          return jreq.query();
        };
        req.headers = function() {
          if (!reqHeaders) {
            reqHeaders = new org.vertx.java.platform.impl.ScriptableMap(jreq.headers());
          }
          return reqHeaders;
        };
        req.params = function() {
          if (!reqParams) {
            reqParams = new org.vertx.java.platform.impl.ScriptableMap(jreq.params());
          }
          return reqParams;
        };
        req.remoteAddress = function() {
          return jreq.remoteAddress();
        };
        req.peerCertificateChain = function() {
          return jreq.peerCertificateChain();
        };
        req.absoluteURI = function() {
          return jreq.absoluteURI();
        };
        req.bodyHandler = function(handler) {
          jreq.bodyHandler(handler);
          return req;
        };
        
        var jresp = jreq.response();
        var respHeaders = null;
        var respTrailers = null;

        var resp = {};
        writeStream(resp, jresp);
        resp.statusCode = function(code) {
          if (code) {
            jresp.setStatusCode(code);
            return resp;
          } else {
            return jresp.getStatusCode();
          }
        };
        resp.statusMessage = function(msg) {
          if (msg) {
            jresp.setStatusMessage(msg);
            return resp;
          } else {
            return jresp.getStatusMessage();
          }
        };
        resp.chunked = function(ch) {
          if (ch) {
            jresp.setChunked(ch);
            return resp;
          } else {
            return jresp.isChunked();
          }
        };
        resp.headers = function() {
          if (!respHeaders) {
            respHeaders = new org.vertx.java.platform.impl.ScriptableMap(jresp.headers());
          }
          return respHeaders;
        };
        resp.putHeader = function(k, v) {
          jresp.putHeader(k, v);
          return resp;
        };
        resp.putAllHeaders = function(other) {
          var hdrs = resp.headers();
          for (var k in other) {
            hdrs[k] = other[k];
          }
          return resp;
        };
        resp.trailers = function() {
          if (!respTrailers) {
            respTrailers = new org.vertx.java.platform.impl.ScriptableMap(jresp.trailers());
          }
          return respTrailers;
        };
        resp.putTrailer = function(k, v) {
          jresp.putTrailer(k, v);
          return resp;
        };
        resp.putAllTrailers = function(other) {
          var trlrs = resp.trailers();
          for (var k in other) {
            trlrs[k] = other[k];
          }
          return resp;
        };
        resp.write = function(arg0, arg1, arg2) {
          if (arg2 === undefined) {
            if (arg1 === undefined) {
              jresp.write(arg0);
            } else {
              if (typeof(arg1) === 'function') {
                arg1 = adaptAsyncResultHandler(arg1);
              }
              jresp.write(arg0, arg1);
            }
          } else {
            if (typeof(arg2) === 'function') {
              arg2 = adaptAsyncResultHandler(arg2);
            }
            jresp.write(arg0, arg1, arg2);
          }
          return resp;
        };
        resp.sendHead = function() {
          jresp.sendHead();
          return resp;
        };
        resp.end = function(arg0, arg1) {
          if (arg0) {
            if (arg1) {
              jresp.end(arg0, arg1);
            } else {
              jresp.end(arg0);
            }
          } else {
            jresp.end();
          }
        };
        resp.sendFile = function(fileName) {
          jresp.sendFile(fileName);
          return resp;
        };

        req.response = resp;
        handler(req);
      }
    }
    
    load("core/ssl_support.js");
    load("core/tcp_support.js");

    function wrapWebsocketHandler(server, handler) {
      return function(jwebsocket) {
        var ws = {};
        readStream(ws, jwebsocket);
        writeStream(ws, jwebsocket);
        ws.binaryHandlerID = function() {
          return jwebsocket.binaryHandlerID();
        };
        ws.textHandlerID = function() {
          return jwebsocket.textHandlerID();
        };
        ws.writeBinaryFrame = function(data) {
          jwebsocket.writeBinaryFrame(data);
        };
        ws.writeTextFrame = function(data) {
          jwebsocket.writeTextFrame(data);
        };
        ws.closedHandler = function(handler) {
          jwebsocket.closedHandler(handler);
          return ws;
        };
        ws.close = function() {
          jwebsocket.close();
        };
        if (server) {
          ws.path = function() {
            return jwebsocket.path();
          };
          ws.reject = function() {
            jwebsocket.reject();
            return ws;
          }
        }
        handler(ws);
      }
    }

    vertx.createHttpServer = function() {
      var jserver = __jvertx.createHttpServer();
      var server = {};
      sslSupport(server, jserver);
      serverSslSupport(server, jserver);
      tcpSupport(server, jserver);
      serverTcpSupport(server, jserver);
      server.requestHandler = function(handler) {
        if (handler) {  
          if (typeof handler === 'function') {
            handler = wrappedRequestHandler(handler);
          } else {
            // It's a route matcher
            handler = handler._to_java_handler();
          }
          jserver.requestHandler(handler);
        }
        return server;
      };
      server.websocketHandler = function(handler) {
        if (handler) {
          jserver.websocketHandler(wrapWebsocketHandler(true, handler));
        }
        return server;
      };
      server.close = function(handler) {
        if (jserver) {
          jserver.close(handler);
        } else {
          jserver.close();
        }
      };
      server.listen = function(port, host) {
        if (host) {
          jserver.listen(port, host);
        } else {
          jserver.listen(port);
        }
        return server;
      };
      return server;
    }

    vertx.createHttpClient = function() {
      var jclient = __jvertx.createHttpClient();

      function wrapResponseHandler(handler) {
        return function(jresp) {

          var respHeaders = null;
          var respTrailers = null;

          var resp = {};
          readStream(resp, jresp);
          resp.statusCode = function() {
            return jresp.statusCode();
          };
          resp.statusMessage = function() {
            return jresp.statusMessage();
          };
          resp.headers = function() {
            if (!respHeaders) {
              respHeaders = new org.vertx.java.platform.impl.ScriptableMap(jresp.headers());
            }
            return respHeaders;
          };
          resp.trailers = function() {
            if (!respTrailers) {
              respTrailers = new org.vertx.java.platform.impl.ScriptableMap(jresp.trailers());
            }
            return respTrailers;
          };
          resp.cookies = function() {
            return jresp.cookies();
          };
          resp.bodyHandler = function(handler) {
            jresp.bodyHandler(handler);
            return resp;
          };
          handler(resp);
        }
      }

      function wrapRequest(jreq) {

        var reqHeaders = null;

        var req = {};
        writeStream(req, jreq);
        req.chunked = function(ch) {
          if (ch === undefined) {
            return jreq.isChunked();
          } else {
            jreq.setChunked(ch);
          }
        };
        req.headers = function() {
          if (!reqHeaders) {
            reqHeaders = new org.vertx.java.platform.impl.ScriptableMap(jreq.headers());
          }
          return reqHeaders;
        };
        req.putHeader = function(k, v) {
          jreq.putHeader(k, v);
          return req;
        };
        req.putAllHeaders = function(other) {
          var hdrs = wrapped.headers();
          for (var k in other) {
            hdrs[k] = other[k];
          }
          return req;
        };
        req.write = function(arg0, arg1, arg2) {
          if (arg1) {
            if (arg2) {
              jreq.write(arg0, arg1, arg2);
            } else {
              jreq.write(arg0, arg1);
            }
          } else {
            jreq.write(arg0);
          }
          return req;
        };
        req.continueHandler = function(handler) {
          jreq.continueHandler(handler);
          return req;
        };
        req.sendHead = function() {
          jreq.sendHead();
          return req;
        };
        req.end = function(arg0, arg1) {
          if (arg0) {
            if (arg1) {
              jreq.end(arg0, arg1);
            } else {
              jreq.end(arg0);
            }
          } else {
            jreq.end();
          }
        };
        req.timeout = function(t) {
          jreq.setTimeout(t);
        };    
        return req;
      }

      var client = {};
      sslSupport(client, jclient);
      clientSslSupport(client, jclient);
      tcpSupport(client, jclient);
      client.exceptionHandler = function(handler) {
        jclient.exceptionHandler(handler);
        return client;
      };
      client.maxPoolSize = function(size) {
        if (size === undefined) {
          return jclient.getMaxPoolSize();
        } else {
          jclient.setMaxPoolSize(size);
          return client;
        }
      };
      client.keepAlive = function(ka) {
        if (ka === undefined) {
          return jclient.isKeepAlive();
        } else {
          jclient.setKeepAlive(ka);
          return client;
        }
      };
      client.port = function(p) {
        if (p === undefined) {
          return jclient.getPort();
        } else {
          jclient.setPort(p);
          return client;
        }
      };
      client.host = function(h) {
        if (h === undefined) {
          return jclient.getHost();
        } else {
          jclient.setHost(h);
          return client;
        }
      };
      client.verifyHost = function(h) {
        if (h === undefined) {
          return jclient.isVerifyHost();
        } else {
          jclient.setVerifyHost(h);
          return client;
        }
      };
      client.connectWebsocket = function(uri, handler) {
        jclient.connectWebsocket(uri, wrapWebsocketHandler(false, handler));
      };
      client.getNow = function(uri, handler) {
        return wrapRequest(jclient.getNow(uri, wrapResponseHandler(handler)));
      };
      client.options = function(uri, handler) {
        return wrapRequest(jclient.options(uri, wrapResponseHandler(handler)));
      };
      client.get =function(uri, handler) {
        return wrapRequest(jclient.get(uri, wrapResponseHandler(handler)));
      };
      client.head =function(uri, handler) {
        return wrapRequest(jclient.head(uri, wrapResponseHandler(handler)));
      };
      client.post = function(uri, handler) {
        return wrapRequest(jclient.post(uri, wrapResponseHandler(handler)));
      };
      client.put = function(uri, handler) {
        return wrapRequest(jclient.put(uri, wrapResponseHandler(handler)));
      };
      client.delete = function(uri, handler) {
        return wrapRequest(jclient.delete(uri, wrapResponseHandler(handler)));
      };
      client.trace = function(uri, handler) {
        return wrapRequest(jclient.trace(uri, wrapResponseHandler(handler)));
      };
      client.connect = function(uri, handler) {
        return wrapRequest(jclient.connect(uri, wrapResponseHandler(handler)));
      };
      client.patch = function(uri, handler) {
        return wrapRequest(jclient.patch(uri, wrapResponseHandler(handler)));
      };
      client.request = function(method, uri, handler) {
        return wrapRequest(jclient.request(method, uri, wrapResponseHandler(handler)));
      };
      client.close = function() {
        jclient.close();
      };
      return client;
    }

    vertx.RouteMatcher = function() {

      var j_rm = new org.vertx.java.core.http.RouteMatcher();

      this.get = function(pattern, handler) {
        j_rm.get(pattern, wrappedRequestHandler(handler));
      }

      this.put = function(pattern, handler) {
        j_rm.put(pattern, wrappedRequestHandler(handler));
      }

      this.post = function(pattern, handler) {
        j_rm.post(pattern, wrappedRequestHandler(handler));
      }

      this.delete = function(pattern, handler) {
        j_rm.delete(pattern, wrappedRequestHandler(handler));
      }

      this.options = function(pattern, handler) {
        j_rm.options(pattern, wrappedRequestHandler(handler));
      }

      this.head = function(pattern, handler) {
        j_rm.head(pattern, wrappedRequestHandler(handler));
      }

      this.trace = function(pattern, handler) {
        j_rm.trace(pattern, wrappedRequestHandler(handler));
      }

      this.connect = function(pattern, handler) {
        j_rm.connect(pattern, wrappedRequestHandler(handler));
      }

      this.patch = function(pattern, handler) {
        j_rm.patch(pattern, wrappedRequestHandler(handler));
      }

      this.all = function(pattern, handler) {
        j_rm.all(pattern, wrappedRequestHandler(handler));
      }

      this.getWithRegEx = function(pattern, handler) {
        j_rm.getWithRegEx(pattern, wrappedRequestHandler(handler));
      }

      this.putWithRegEx = function(pattern, handler) {
        j_rm.putWithRegEx(pattern, wrappedRequestHandler(handler));
      }

      this.postWithRegEx = function(pattern, handler) {
        j_rm.postWithRegEx(pattern, wrappedRequestHandler(handler));
      }

      this.deleteWithRegEx = function(pattern, handler) {
        j_rm.deleteWithRegEx(pattern, wrappedRequestHandler(handler));
      }

      this.optionsWithRegEx = function(pattern, handler) {
        j_rm.optionsWithRegEx(pattern, wrappedRequestHandler(handler));
      }

      this.headWithRegEx = function(pattern, handler) {
        j_rm.headWithRegEx(pattern, wrappedRequestHandler(handler));
      }

      this.traceWithRegEx = function(pattern, handler) {
        j_rm.traceWithRegEx(pattern, wrappedRequestHandler(handler));
      }

      this.connectWithRegEx = function(pattern, handler) {
        j_rm.connectWithRegEx(pattern, wrappedRequestHandler(handler));
      }

      this.patchWithRegEx = function(pattern, handler) {
        j_rm.patchWithRegEx(pattern, wrappedRequestHandler(handler));
      }

      this.allWithRegEx = function(pattern, handler) {
        j_rm.allWithRegEx(pattern, wrappedRequestHandler(handler));
      }

      this.noMatch = function(handler) {
        j_rm.noMatch(wrappedRequestHandler(handler));
      }

      this._to_java_handler = function() {
        return j_rm;
      }
    }
  })();
}

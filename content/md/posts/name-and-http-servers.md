{:title "__name__ and HTTP servers"
 :date "2009-05-13"
 :layout :post}

The `__name__` built-in Python variable which describes exactly that - it's the name of the module during runtime. Python modules use this variable to perform a particular action when the module is run, and probably do something else when imported by another module. It also facilitates module testing if you think about it.


Ideally, every Python module that is intended to be reused must have something like this in it, preferably at the end.

```python
if __name__ == "__main__":
    print "Just got executed!"
else:
    print "Got imported! I'm so cool!"
```

Several modules that are part of the standard Python library use this in profound ways.
For example, the `SimpleHTTPServer` module, which is run as shown below, starts a simple HTTP-based file server hosting the current working directory.

```
$ python -m SimpleHTTPServer
Serving HTTP on 0.0.0.0 port 8000 ...
127.0.0.1 - - [10/May/2009 18:55:05] "GET / HTTP/1.1" 200 -
```

So, don't overlook the use `__name__` in your code thinking no one will actually like your puny little module.

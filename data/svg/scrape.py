#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import re
import os
import urllib

def open_file(path):
    with open(path) as f:
        return f.read()

def save_json(file, path):
    with open(path, 'w') as f:
        json.dump(file, f)

def get_country_sections():
    path = 'timeline.md'
    res = dict()
    section = ""
    current_name = ""

    lines = unicode(open_file(path), 'utf-8').split('\n')
    for line in lines:
        pattern = re.compile(r"^\[([\w\s]+)\]\(.*\)({\.mw-redirect})?$", re.UNICODE)
        match = re.match(pattern, line)
        if match:
            name = match.group(1) # country name
            if name != current_name:
                assert current_name not in res
                res[current_name] = section

                section = "" # reset section
                current_name = name
                continue
        section += line + '\n'

    del res['']# remove header stuff
    return res

def get_desired_years(sections):
    res = dict()
    for name in sections:
        section = sections[name]

        pattern = re.compile(r"\n(\d+)\n", re.UNICODE)
        match = re.findall(pattern, section)

        year = None
        for s in match:
            if year is None or year < int(s) < 1986:
                year = int(s)

        assert name not in res
        res[name] = str(year)
    return res

def get_flags(sections, years):
    res = dict()
    for name in sections:
        section = sections[name]

        pattern = re.compile(r"\n.+\n"+years[name], re.UNICODE)
        match = re.findall(pattern, section)[-1] # last element = most recent
        if match:
            s = match

            pattern = re.compile(r"/thumb/(.*)", re.UNICODE)
            match = re.findall(pattern, s)[0]

            if match:
                flag = "https://upload.wikimedia.org/wikipedia/commons/" + match[:match.find('svg')+3]
                assert name not in res
                res[name] = flag
                continue
        assert False
    return res

def generate_gallery(flags, path):
    res = dict()
    for name in flags:
        url = flags[name]

        filename = url.split('/')[-1]
        filename = filename.replace(u'%E2%80%93', u'–')
        filename = urllib.unquote(filename)
        res[name] = filename

        if not os.path.isfile(filename):
            print('do ' + filename)
            os.system('wget '+url)
    save_json(res, path)
    return res

sections = get_country_sections()
years = get_desired_years(sections)
flags = get_flags(sections, years)
z = generate_gallery(flags, 'gallery.json')
# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "theme.kieran.casa"
  spec.version       = "0.1.0"
  spec.authors       = ["Kieran Hunt"]
  spec.email         = ["hunkiera@amazon.com"]

  spec.summary       = "Test"
  spec.homepage      = "http://kieran.casa"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(assets|_data|_layouts|_includes|_sass|LICENSE|README|_config\.yml)!i) }

  spec.add_runtime_dependency "jekyll", "~> 4.3"
end
